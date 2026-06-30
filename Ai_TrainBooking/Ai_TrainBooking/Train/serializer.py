from rest_framework import serializers
from .models import Train, TrainClass, Seat


class TrainClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainClass
        fields = ['class_type', 'price', 'available_seats']


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['seat_number', 'is_booked']


class TrainSerializer(serializers.ModelSerializer):
    classes = TrainClassSerializer(many=True, read_only=True)
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Train
        fields = [
            'train_id',
            'name',
            'number',
            'from_station',
            'to_station',
            'departure',
            'arrival',
            'duration',
            'train_type',
            'rating',
            'amenities',
            'classes',
            'seats',
        ]
