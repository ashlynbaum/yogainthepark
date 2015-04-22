#API Documentation for Events

- request payloads are sent as json with `Content-Type: application/json; charset=UTF-8` header

## Create an event

Takes data from these params, and creates this database record.

```
POST /events
```

### Input example

```json
{
  "title":"event name",
  "description":"event description",
  "location":{
    "position":{
      "lat": -41.299553,
      "lon": 174.768181
    },
    "name":"Central Park",
    "city":"Wellington",
    "country":"NZ"
  },
  "event_start_time":"2015-03-26T23:20:32Z",
  "event_end_time":"2015-03-26T23:40:32Z",
  "imgs":[
    "https://gebarbieri.files.wordpress.com/2014/03/barefoot-in-the-park-yoga-6-25-09-45.jpg?w=599",
    "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKMgybw0vsuK_GMwCw0UUM30fQgRpRgkgIeNZMGnxt1rX8glnPog"
  ]
}
```

### Response

```
Status: 201 CREATED
```

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title":"event name",
  "description":"event description",
  "location":{
    "position":{
      "lat": -41.299553,
      "lon": 174.768181
    },
    "name":"Central Park",
    "city":"Wellington",
    "country":"NZ"
  },
  "event_start_time":"2015-03-26T23:20:32Z",
  "event_end_time":"2015-03-26T23:40:32Z",
  "imgs":[
    "https://gebarbieri.files.wordpress.com/2014/03/barefoot-in-the-park-yoga-6-25-09-45.jpg?w=599",
    "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKMgybw0vsuK_GMwCw0UUM30fQgRpRgkgIeNZMGnxt1rX8glnPog"
  ]
}
```


## List all the events

Respond with all events.

```
GET /events
```

### Response

```
Status: 200 OK
```

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title":"event name",
    "description":"event description",
    "location":{
      "position":{
        "lat": -41.299553,
        "lon": 174.768181
      },
      "name":"Central Park",
      "city":"Wellington",
      "country":"NZ"
    },
    "event_date":"",
    "event_start_time":"",
    "event_end_time":"",
    "imgs":[
      "https://gebarbieri.files.wordpress.com/2014/03/barefoot-in-the-park-yoga-6-25-09-45.jpg?w=599",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKMgybw0vsuK_GMwCw0UUM30fQgRpRgkgIeNZMGnxt1rX8glnPog"
    ]
  }
]
```



## Show event details

```
GET /events/{id}
```

### Response

```
Status: 200 OK
```

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title":"event name",
    "description":"event description",
    "location":{
      "position":{
        "lat": -41.299553,
        "lon": 174.768181
      },
      "name":"Central Park",
      "city":"Wellington",
      "country":"NZ"
    },
    "event_date":"",
    "event_start_time":"",
    "event_end_time":"",
    "imgs":[
      "https://gebarbieri.files.wordpress.com/2014/03/barefoot-in-the-park-yoga-6-25-09-45.jpg?w=599",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKMgybw0vsuK_GMwCw0UUM30fQgRpRgkgIeNZMGnxt1rX8glnPog"
    ]
  }
]
```
## Update an event

```
PATCH /events/{id}
```
### Input example

```json
{
  "title":"event name",
}
### Response

```
Status: 200 OK
```
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title":"event name",
    "description":"event description",
    "location":{
      "position":{
        "lat": -41.299553,
        "lon": 174.768181
      },
      "name":"Central Park",
      "city":"Wellington",
      "country":"NZ"
    },
    "event_date":"",
    "event_start_time":"",
    "event_end_time":"",
    "imgs":[
      "https://gebarbieri.files.wordpress.com/2014/03/barefoot-in-the-park-yoga-6-25-09-45.jpg?w=599",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKMgybw0vsuK_GMwCw0UUM30fQgRpRgkgIeNZMGnxt1rX8glnPog"
    ]
  }
]
```

## Delete an event

```
DELETE /events/{id}
```

### Response

```
Status: 204 NO CONTENT
```

## User Registration
```
POST /signup
```
### Input example

```json
{
  "email": "example@example.com",
  "First Name": "Ashlyn",
  "Last Name": "Baum",
  "Password": "******" 
}
### Response
```
Status: 200 ok
```
```json{
  "id": "507f1f77bcf86cd799439012"
}
## User Authentication
```
POST /login
```
### Input Example
```json{
  "email": "example@example.com",
  "Password": "****"
}
### Response
```
Status: 200 ok
```
```json{
  "id": "507f1f77bcf86cd799439012"
}
```

