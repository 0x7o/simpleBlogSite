FROM python:3.8


WORKDIR /app/backend
COPY requirements.txt /app/backend
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt


COPY . /app/backend

EXPOSE 9000
CMD gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:9000 --reload --workers 1 --timeout 120