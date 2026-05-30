from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Shop, Product, Order, OrderItem, Message

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'name', 'role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'name')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'name', 'email')}),
    )

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'shop', 'total', 'payment_method', 'status', 'commission', 'created_at']
    list_filter = ['status', 'payment_method']
    inlines = [OrderItemInline]

admin.site.register(User, CustomUserAdmin)
admin.site.register(Shop)
admin.site.register(Product)
admin.site.register(Order, OrderAdmin)
admin.site.register(Message)
