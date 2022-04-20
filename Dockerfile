FROM python:3.10

WORKDIR /usr/src/app
RUN pip install pipenv

COPY Pipfile ./
COPY Pipfile.lock ./

RUN pipenv install --system

COPY . .

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]