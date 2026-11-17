Django gives you a lot out of the box, and that is exactly why it is easy to use it badly. Most Django performance problems, security slips and messy codebases I have seen came from a handful of habits: queries in loops, business logic scattered across views, and settings copied from a tutorial into production. This reference collects the patterns I use day to day with Django and Django REST Framework (DRF). Examples target modern Django (5.x) and Python 3.12+.

## 1. Project structure

```
myproject/
├── manage.py
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── accounts/
│   ├── projects/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py      # business logic lives here
│   │   ├── selectors.py     # complex read queries live here
│   │   ├── permissions.py
│   │   ├── urls.py
│   │   └── tests/
│   └── billing/
└── requirements/
```

Principles:

- **Apps by domain** (`projects`, `billing`), not by layer (`models`, `views`).
- **Split settings** by environment. Read secrets from environment variables.
- **Thin views, thin serializers.** Put business rules in plain functions (a `services.py` module works well). They are easier to test and reuse from views, management commands, tasks and the admin.

## 2. Custom user model: do it first

Start every project with a custom user model, even if it is empty. Switching later, once migrations and foreign keys exist, is painful.

```python
# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
```

```python
# settings/base.py
AUTH_USER_MODEL = "accounts.User"
```

Elsewhere, refer to it with `settings.AUTH_USER_MODEL` in models and `get_user_model()` in code.

## 3. Models

```python
from django.conf import settings
from django.db import models
from django.db.models import Q

class Project(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220)
    status = models.CharField(max_length=20, choices=Status, default=Status.ACTIVE)
    budget_cents = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["owner", "status"])]
        constraints = [
            models.UniqueConstraint(fields=["owner", "slug"], name="uniq_project_slug_per_owner"),
            models.CheckConstraint(condition=Q(budget_cents__lte=100_000_000), name="budget_cap"),
        ]

    def __str__(self) -> str:
        return self.name
```

Notes:

- **`TextChoices`** gives you readable values, labels, and `Project.Status.ACTIVE` in code instead of magic strings.
- **Database constraints** (`UniqueConstraint`, `CheckConstraint`) protect data even when someone bypasses your forms or serializers. Model validation alone does not. (On Django versions before 5.1, `CheckConstraint` takes `check=` instead of `condition=`.)
- **`on_delete`** deserves a real decision. `CASCADE` for owned children, `PROTECT` for things that must not disappear silently (invoices), `SET_NULL` for optional links.
- **Money as integers** in the smallest unit, or `DecimalField`. Never `FloatField`.
- **`related_name`** on every foreign key so reverse lookups read naturally: `user.projects.all()`.

### Migrations

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
python manage.py sqlmigrate projects 0004   # see the SQL before it runs
```

Commit migrations with the code that needs them. Review them in PRs. On large tables, be careful with operations that lock or rewrite the table (adding a non-nullable column with a default on some databases, adding an index without `CONCURRENTLY` on Postgres). For risky changes, split into steps: add a nullable column, backfill, then add the constraint.

## 4. The ORM

### Everyday queries

```python
Project.objects.filter(owner=user, status=Project.Status.ACTIVE)
Project.objects.exclude(status=Project.Status.ARCHIVED)
Project.objects.get(pk=pk)                       # raises DoesNotExist / MultipleObjectsReturned
Project.objects.filter(name__icontains="site")
Project.objects.filter(created_at__date__gte=date(2026, 1, 1))
Project.objects.filter(owner__email__endswith="@example.com")   # across relations
Project.objects.order_by("-created_at")[:20]
Project.objects.filter(owner=user).exists()
Project.objects.filter(owner=user).count()
```

### Q and F

```python
from django.db.models import F, Q

# OR conditions
Project.objects.filter(Q(status="active") | Q(owner=user))

# Compare fields, or update atomically in the database
Task.objects.filter(completed_at__gt=F("due_at"))
Product.objects.filter(pk=pk, stock__gt=0).update(stock=F("stock") - 1)
```

The `F()` update is a single SQL statement, so two concurrent requests cannot both read `stock = 1` and both sell the last item.

### Aggregation and annotation

```python
from django.db.models import Count, Sum, Avg

Project.objects.aggregate(total=Sum("budget_cents"))         # one dict
Project.objects.annotate(task_count=Count("tasks"))          # a value per row
User.objects.annotate(n=Count("projects")).filter(n__gt=5)
```

When you annotate with several `Count`s across different relations, the joins multiply rows. Use `Count("tasks", distinct=True)` or subqueries.

### The N+1 problem and how to fix it

```python
# 1 query for projects, then 1 query per project for its owner: N+1
for p in Project.objects.all():
    print(p.owner.email)
```

```python
# Foreign key or one-to-one: join in the same query
Project.objects.select_related("owner")

# Reverse FK or many-to-many: one extra query for all of them
Project.objects.prefetch_related("tasks", "tags")

# Control what gets prefetched
from django.db.models import Prefetch
Project.objects.prefetch_related(
    Prefetch("tasks", queryset=Task.objects.filter(done=False).only("id", "title"))
)
```

`select_related` for "forward, single object" relations. `prefetch_related` for "many" relations. Adding these to list views is the single biggest performance win in most Django apps.

### Doing less work

```python
Project.objects.only("id", "name")                 # load just these columns
Project.objects.defer("description")               # load everything except these
Project.objects.values("id", "name")               # dicts, no model instances
Project.objects.values_list("id", flat=True)       # plain list of ids
Project.objects.filter(...).update(status="archived")   # one UPDATE, no loading
Project.objects.bulk_create([Project(...), Project(...)], batch_size=500)
Project.objects.bulk_update(projects, ["status"], batch_size=500)
for p in Project.objects.iterator(chunk_size=2000): ...   # stream large querysets
```

Note that `update()`, `bulk_create()` and `bulk_update()` skip `save()` and signals. That is usually what you want for bulk work, but be aware of it.

### Get or create

```python
obj, created = Tag.objects.get_or_create(name="django", defaults={"color": "green"})
obj, created = Setting.objects.update_or_create(user=user, key="theme", defaults={"value": "dark"})
```

Back these with a unique constraint, otherwise two concurrent requests can both create.

### Transactions and locking

```python
from django.db import transaction

@transaction.atomic
def transfer(from_id, to_id, amount):
    a = Account.objects.select_for_update().get(pk=from_id)
    b = Account.objects.select_for_update().get(pk=to_id)
    if a.balance < amount:
        raise InsufficientFunds()
    a.balance -= amount
    b.balance += amount
    a.save(update_fields=["balance"])
    b.save(update_fields=["balance"])
```

And send emails or enqueue tasks **after** the transaction commits, so you never notify about data that got rolled back:

```python
transaction.on_commit(lambda: send_welcome_email.delay(user.id))
```

### Custom managers and querysets

```python
class ProjectQuerySet(models.QuerySet):
    def active(self):
        return self.filter(status=Project.Status.ACTIVE)

    def for_user(self, user):
        return self.filter(owner=user)

class Project(models.Model):
    ...
    objects = ProjectQuerySet.as_manager()

# Chainable and readable
Project.objects.for_user(request.user).active()
```

## 5. Serializers (DRF)

```python
from rest_framework import serializers

class ProjectSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    task_count = serializers.IntegerField(read_only=True)  # from .annotate()

    class Meta:
        model = Project
        fields = ["id", "name", "slug", "status", "budget_cents", "owner_email", "task_count", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def validate_name(self, value):
        if value.strip().lower() == "untitled":
            raise serializers.ValidationError("Please choose a real name.")
        return value.strip()

    def validate(self, attrs):
        if attrs.get("status") == Project.Status.ARCHIVED and attrs.get("budget_cents"):
            raise serializers.ValidationError({"budget_cents": "Archived projects cannot have a budget."})
        return attrs
```

Guidelines:

- **List `fields` explicitly.** `fields = "__all__"` leaks new columns (including sensitive ones) the moment someone adds them to the model.
- **`validate_<field>`** for single-field rules, **`validate`** for rules across fields.
- **Different serializers for different jobs** is normal: a compact one for lists, a detailed one for retrieve, a separate input serializer for writes.
- **Nested writes** are not automatic. For writable nested data, override `create()` and `update()`, or better, accept IDs and handle relationships in a service function.
- **Never compute queries inside `SerializerMethodField`** for list views. Annotate in the queryset instead, or you have rebuilt the N+1 problem.

## 6. Views

### Function-based views

```python
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required

@login_required
def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug, owner=request.user)
    return render(request, "projects/detail.html", {"project": project})
```

Clear, explicit, great for anything unusual.

### Class-based views

```python
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView

class ProjectListView(LoginRequiredMixin, ListView):
    template_name = "projects/list.html"
    paginate_by = 20

    def get_queryset(self):
        return Project.objects.for_user(self.request.user).select_related("owner")
```

### DRF ViewSets and routers

```python
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Project.objects.for_user(self.request.user)
            .select_related("owner")
            .annotate(task_count=Count("tasks", distinct=True))
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def archive(self, request, slug=None):
        project = self.get_object()
        archive_project(project, by=request.user)   # service function
        return Response(status=204)
```

```python
# urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
urlpatterns = router.urls
```

**Scope the queryset to the user in `get_queryset`.** That one habit prevents most data-leak bugs, because objects another user owns simply return `404`.

Which to use: ViewSets for standard CRUD resources, `APIView` or generic views for one-off endpoints, function-based views for anything that does not fit a pattern. Do not bend a ViewSet into a shape it was not made for.

## 7. Authentication

| Option | Use for |
|---|---|
| Django sessions | Server-rendered sites and SPAs on the same domain |
| DRF `TokenAuthentication` | Simple API clients. One static token per user, no expiry by default |
| JWT (`djangorestframework-simplejwt`) | Mobile apps, separate frontends, services. Short-lived access plus refresh tokens |
| OAuth and social login (`django-allauth`) | "Sign in with Google/GitHub", SSO |

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}
```

Make `IsAuthenticated` the default and opt out explicitly with `AllowAny` on public endpoints. Forgetting to protect something is a worse failure than forgetting to open it.

If you use session auth with a JavaScript frontend, keep CSRF protection on and send the CSRF token in a header.

## 8. Permissions

```python
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id
```

Things that trip people up:

- `has_object_permission` only runs when the view calls `get_object()`. It does **not** filter list endpoints. Filter in `get_queryset` too.
- Combine permissions with `&`, `|` and `~`: `permission_classes = [IsAuthenticated & (IsOwner | IsAdminUser)]`.
- For roles inside organisations (owner, editor, viewer), model the membership explicitly and check it in one helper, rather than sprinkling role checks across views.

## 9. Testing

```python
import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api(user):
    client = APIClient()
    client.force_authenticate(user)
    return client

@pytest.mark.django_db
def test_user_cannot_see_others_projects(api, user, other_user):
    ProjectFactory(owner=other_user, slug="secret")
    response = api.get("/api/projects/secret/")
    assert response.status_code == 404

@pytest.mark.django_db
def test_list_query_count(api, user, django_assert_max_num_queries):
    ProjectFactory.create_batch(20, owner=user)
    with django_assert_max_num_queries(4):
        api.get("/api/projects/")
```

What I rely on:

- **pytest with `pytest-django`**, plus **`factory_boy`** for test data. Factories beat fixtures files because they stay in sync with your models.
- **Test permissions explicitly.** For every endpoint: anonymous, wrong user, right user.
- **Assert query counts** on list endpoints (`assertNumQueries` in Django's `TestCase`, or the `django_assert_num_queries` / `django_assert_max_num_queries` fixtures in pytest-django). This catches N+1 regressions before production does.
- **Test services directly**, without HTTP, for business rules. Keep view tests for wiring, status codes and permissions.
- Use `TestCase` (wraps each test in a transaction) over `TransactionTestCase` unless you need to test commit behaviour such as `on_commit` hooks. For those, `self.captureOnCommitCallbacks(execute=True)` is often enough.

## 10. Performance

In the order I check things:

1. **Count queries.** Install `django-debug-toolbar` in development, or log queries. Look at every list page.
2. **Fix N+1** with `select_related` and `prefetch_related`.
3. **Add indexes** for fields used in `filter`, `order_by` and joins. Check with `queryset.explain()`.
4. **Paginate everything.** Set a default in DRF:

```python
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.CursorPagination",
    "PAGE_SIZE": 25,
}
```

   `CursorPagination` needs a stable ordering field (it defaults to `-created`, so set `ordering` on the paginator class if your field is `created_at`). Use `PageNumberPagination` where you need page numbers.

5. **Load less.** `only()`, `values()`, annotations instead of Python loops.
6. **Cache** expensive, read-heavy results:

```python
from django.core.cache import cache

def dashboard_stats(org_id):
    key = f"stats:v1:{org_id}"
    stats = cache.get(key)
    if stats is None:
        stats = compute_stats(org_id)
        cache.set(key, stats, timeout=300)
    return stats
```

7. **Move slow work out of requests** into a task queue (Celery, RQ, Dramatiq, or Django's built-in tasks framework if you are on a version that has it). Emails, exports, image processing and third-party API calls all belong there.
8. **Reuse database connections.** Set `CONN_MAX_AGE`, or on Django 5.1+ with PostgreSQL and psycopg 3, enable the built-in pool with `"OPTIONS": {"pool": True}`. Behind many workers, a pooler such as PgBouncer is still worth considering.

## 11. Deployment

### Settings for production

```python
DEBUG = False
SECRET_KEY = env("DJANGO_SECRET_KEY")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")
CSRF_TRUSTED_ORIGINS = env.list("DJANGO_CSRF_TRUSTED_ORIGINS")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")  # only behind a trusted proxy
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000   # start lower while you verify HTTPS everywhere
SECURE_CONTENT_TYPE_NOSNIFF = True
```

Then run Django's own checklist:

```bash
python manage.py check --deploy
```

### Static and media files

- `python manage.py collectstatic` during the build.
- Serve static files with **WhiteNoise** or a CDN. Do not rely on `runserver`.
- User uploads (media) go to object storage (S3, Azure Blob, GCS) via `django-storages`, not the container's disk, which disappears on redeploy.

### Application server

```bash
gunicorn config.wsgi:application --workers 3 --timeout 30
# or for async views and websockets
gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker
```

A common starting point for workers is around two per CPU core plus one, then tune from metrics.

### Release steps

1. Build the image, run tests, run `check --deploy`.
2. Run `migrate` as a **separate release step**, once, not on every container start.
3. Make migrations backward compatible so old and new code can run side by side during the rollout.
4. Deploy the app, watch error rates and latency.

### Operations

- Error tracking (Sentry or similar) and structured logs with a request ID.
- A health check endpoint that touches the database.
- Automated database backups, with a restore you have actually tried.
- Keep Django and dependencies updated. Read release notes for deprecations before major upgrades.

## Quick reference

```bash
django-admin startproject config .
python manage.py startapp projects
python manage.py makemigrations && python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
python manage.py shell
python manage.py dbshell
python manage.py test           # or: pytest
python manage.py check --deploy
python manage.py collectstatic --noinput
```

| Need | Reach for |
|---|---|
| Avoid N+1 on FK | `select_related()` |
| Avoid N+1 on reverse FK or M2M | `prefetch_related()` / `Prefetch()` |
| Atomic counter or stock update | `F()` with `update()` |
| OR conditions | `Q()` |
| Per-row computed values | `annotate()` |
| One summary value | `aggregate()` |
| Multiple writes that must all succeed | `transaction.atomic` |
| Prevent concurrent edits | `select_for_update()` inside a transaction |
| Side effect after commit | `transaction.on_commit()` |
| Data integrity | `UniqueConstraint`, `CheckConstraint` |
| Restrict API data per user | Filter in `get_queryset()` |

Django rewards boring, consistent code. Keep logic in services, keep queries visible and counted, let the database enforce what it can, and the framework will carry a project much further than people give it credit for.
