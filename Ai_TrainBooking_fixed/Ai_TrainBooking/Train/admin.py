from django.contrib import admin
from .models import Train, TrainClass, Seat


class TrainClassInline(admin.TabularInline):
    model = TrainClass
    extra = 1


class SeatInline(admin.TabularInline):
    model = Seat
    extra = 5


@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ('train_id', 'name', 'number', 'from_station', 'to_station')
    inlines = [TrainClassInline, SeatInline]


admin.site.register(TrainClass)
admin.site.register(Seat)
