from django.db import models


class Train(models.Model):
    train_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=10)
    from_station = models.CharField(max_length=50)
    to_station = models.CharField(max_length=50)
    departure = models.CharField(max_length=20)
    arrival = models.CharField(max_length=20)
    duration = models.CharField(max_length=20)
    train_type = models.CharField(max_length=30)
    rating = models.FloatField()
    amenities = models.JSONField()

    def __str__(self):
        return f"{self.name} ({self.number})"


class TrainClass(models.Model):
    train = models.ForeignKey(
        Train,
        related_name="classes",
        on_delete=models.CASCADE
    )
    class_type = models.CharField(max_length=10)
    price = models.IntegerField()
    available_seats = models.IntegerField()

    def __str__(self):
        return f"{self.train.name} - {self.class_type}"


class Seat(models.Model):
    train = models.ForeignKey(
        Train,
        related_name="seats",
        on_delete=models.CASCADE
    )
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return self.seat_number
