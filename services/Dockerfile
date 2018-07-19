FROM tiangolo/uwsgi-nginx-flask:python3.6
  
ENV STATIC_INDEX 1

COPY ./src /app

RUN pip3 --no-cache-dir install -r /app/requirements.txt
