import json

from django.conf import settings
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .serializer import TrainSerializer
from rest_framework.response import Response
from .models import Train
from django.http import JsonResponse, HttpResponse

from google import genai
from google.genai.errors import ClientError, ServerError


@csrf_exempt
@require_POST
def Ai_Rcommendation(request):
    """
    Calls Gemini to produce a short, plain-English explanation of why the
    top seat recommendation suits the passenger, given the train + seat
    details the frontend already computed. Fails gracefully (returns a
    canned message instead of a 500) if no API key is configured or the
    Gemini API call errors out, so the booking flow never breaks because
    of this optional feature.
    """
    if not settings.GEMINI_API_KEY:
        return JsonResponse(
            {
                "ok": False,
                "message": "AI insight is unavailable right now (no GEMINI_API_KEY configured on the server).",
            },
            status=200,
        )

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "message": "Invalid request body."}, status=400)

    train_name = payload.get("train_name", "the selected train")
    from_station = payload.get("from_station", "")
    to_station = payload.get("to_station", "")
    seats = payload.get("seats", [])
    preferences = payload.get("preferences", {})

    prompt = (
        "You are a helpful train-booking assistant. In 2 short sentences, "
        "written directly to the passenger, explain why the following seat "
        f"choice is a good match for their trip.\n"
        f"Train: {train_name} ({from_station} to {to_station})\n"
        f"Recommended seats: {seats}\n"
        f"Passenger preferences: {preferences}\n"
        "Keep it friendly and concise, no markdown."
    )

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # swap for a newer model name if you have access to one
            contents=prompt,
        )
        return JsonResponse({"ok": True, "message": response.text})
    except (ClientError, ServerError):
        return JsonResponse(
            {"ok": False, "message": "AI insight is temporarily unavailable, please try again."},
            status=200,
        )
    except Exception:
        return JsonResponse(
            {"ok": False, "message": "AI insight is temporarily unavailable, please try again."},
            status=200,
        )


def Manual(request):

    return render(request,"manual.html")

def generate_seats(train_id, count):
    seats = []
    for i in range(1, count + 1):
        seats.append({
            "seat_number": f"{train_id}-S{i}",
            "is_booked": False
        })
    return seats


TRAINS_DATA = [
    {
        "id": "T001",
        "name": "Rajdhani Express",
        "number": "12301",
        "from": "Chennai",
        "to": "Mumbai",
        "departure": "06:15 AM",
        "arrival": "10:30 PM",
        "duration": "16h 15m",
        "type": "Superfast",
        "rating": 4.8,
        "amenities": ["wifi", "food", "charging", "ac"],
        "classes": [
            {"type": "1AC", "price": 3250, "available": 12},
            {"type": "2AC", "price": 2150, "available": 24},
            {"type": "3AC", "price": 1450, "available": 45},
            {"type": "SL", "price": 680, "available": 78}
        ],
        "seats": generate_seats("T001", 80)
    },
    {
        "id": "T002",
        "name": "Shatabdi Express",
        "number": "12008",
        "from": "Chennai",
        "to": "Bangalore",
        "departure": "08:00 AM",
        "arrival": "02:45 PM",
        "duration": "6h 45m",
        "type": "Superfast",
        "rating": 4.9,
        "amenities": ["wifi", "food", "charging", "ac"],
        "classes": [
            {"type": "CC", "price": 850, "available": 35},
            {"type": "EC", "price": 1650, "available": 18}
        ],
        "seats": generate_seats("T002", 60)
    },
    {
        "id": "T003",
        "name": "Duronto Express",
        "number": "12263",
        "from": "Chennai",
        "to": "Delhi",
        "departure": "11:30 AM",
        "arrival": "08:15 AM",
        "duration": "20h 45m",
        "type": "Non-stop",
        "rating": 4.7,
        "amenities": ["wifi", "food", "charging", "ac"],
        "classes": [
            {"type": "1AC", "price": 4250, "available": 8},
            {"type": "2AC", "price": 2850, "available": 20},
            {"type": "3AC", "price": 1950, "available": 38}
        ],
        "seats": generate_seats("T003", 70)
    },
    {
        "id": "T004",
        "name": "Intercity Express",
        "number": "12640",
        "from": "Chennai",
        "to": "Coimbatore",
        "departure": "02:15 PM",
        "arrival": "09:30 PM",
        "duration": "7h 15m",
        "type": "Express",
        "rating": 4.5,
        "amenities": ["charging", "ac"],
        "classes": [
            {"type": "2AC", "price": 980, "available": 28},
            {"type": "3AC", "price": 680, "available": 52},
            {"type": "SL", "price": 340, "available": 95}
        ],
        "seats": generate_seats("T004", 100)
    },
    {
        "id": "T005",
        "name": "Vande Bharat Express",
        "number": "20668",
        "from": "Chennai",
        "to": "Mysore",
        "departure": "05:45 AM",
        "arrival": "12:30 PM",
        "duration": "6h 45m",
        "type": "Premium",
        "rating": 4.9,
        "amenities": ["wifi", "food", "charging", "ac"],
        "classes": [
            {"type": "CC", "price": 1250, "available": 42},
            {"type": "EC", "price": 2350, "available": 16}
        ],
        "seats": generate_seats("T005", 65)
    }
]


def train_static_list(request):
    return JsonResponse(TRAINS_DATA, safe=False)


def AI(request):

    return render(request,"Ai.html")

def Index(request):

    return render(request,"manual.html")

def train_list(request):
    trains = Train.objects.all()

    data = []
    for train in trains:
        data.append({
            "train_id": train.train_id,
            "name": train.name,
            "number": train.number,
            "from": train.from_station,
            "to": train.to_station,
            "departure": train.departure,
            "arrival": train.arrival,
            "duration": train.duration,
            "type": train.train_type,
            "rating": train.rating,
            "amenities": train.amenities,

            "classes": [
                {
                    "type": c.class_type,
                    "price": c.price,
                    "available": c.available_seats
                }
                for c in train.classes.all()
            ],

            "seats": [
                {
                    "seat_number": s.seat_number,
                    "is_booked": s.is_booked
                }
                for s in train.seats.all()
            ]
        })

    return JsonResponse(data, safe=False)