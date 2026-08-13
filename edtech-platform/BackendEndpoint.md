Select a definition

Educational Platform API v1
Educational Platform API
 v1 
OAS 3.0
/swagger/v1/swagger.json

Authorize
Account


POST
/api/Account/register


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "email": "string",
  "token": "string"
}
No links

POST
/api/Account/login


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "email": "string",
  "password": "string"
}
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "email": "string",
  "token": "string"
}
No links

POST
/api/Account/register-admin


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "email": "string",
  "token": "string"
}
No links

POST
/api/Account/Logout


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

GET
/api/Account/details


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string"
}
No links
Certificates


POST
/api/Certificates


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "certificateNumber": "string",
  "courseTitle": "string",
  "issuedAt": "2026-08-11T22:12:50.700Z",
  "isRevoked": true,
  "downloadUrl": "string"
}
No links

GET
/api/Certificates/user/{userId}


Parameters
Try it out
Name	Description
userId *
string($uuid)
(path)
userId
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "certificateNumber": "string",
    "courseTitle": "string",
    "issuedAt": "2026-08-11T22:12:50.703Z",
    "isRevoked": true,
    "downloadUrl": "string"
  }
]
No links

GET
/api/Certificates/{certificateId}


Parameters
Try it out
Name	Description
certificateId *
string($uuid)
(path)
certificateId
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "userFullName": "string",
  "courseTitle": "string",
  "certificateNumber": "string",
  "verificationCode": "string",
  "issuedAt": "2026-08-11T22:12:50.706Z",
  "pdfFilePath": "string",
  "instructorName": "string",
  "verificationUrl": "string",
  "logoPath": "string",
  "isRevoked": true
}
No links

POST
/api/Certificates/{certificateId}/revoke


Parameters
Try it out
Name	Description
certificateId *
string($uuid)
(path)
certificateId
reason
string
(query)
reason
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Certificates/verify/{verificationCode}


Parameters
Try it out
Name	Description
verificationCode *
string
(path)
verificationCode
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "certificateNumber": "string",
  "studentName": "string",
  "courseTitle": "string",
  "issuedAt": "2026-08-11T22:12:50.710Z",
  "isValid": true
}
No links

GET
/api/Certificates/{certificateId}/download


Parameters
Try it out
Name	Description
certificateId *
string($uuid)
(path)
certificateId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Certificates/exists/user/{userId}/course/{courseId}


Parameters
Try it out
Name	Description
userId *
string($uuid)
(path)
userId
courseId *
string($uuid)
(path)
courseId
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
true
No links
CourseFiles


GET
/api/CourseFiles


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

POST
/api/CourseFiles


Parameters
Cancel
Reset
No parameters

Request body

multipart/form-data
CourseId *
string($uuid)
3fa85f64-5717-4562-b3fc-2c963f66afa6
LessonId *
string($uuid)
3fa85f64-5717-4562-b3fc-2c963f66afa6
File *
string($binary)
No file chosen
DurationSeconds
integer($int32)
0
Send empty value
UploadedById *
string($uuid)
3fa85f64-5717-4562-b3fc-2c963f66afa6
Execute
Responses
Code	Description	Links
200	
OK

No links

GET
/api/CourseFiles/course/{courseId}


Parameters
Cancel
Name	Description
courseId *
string($uuid)
(path)
courseId
Execute
Responses
Code	Description	Links
200	
OK

No links

GET
/api/CourseFiles/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/CourseFiles/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Request body

multipart/form-data
File
string($binary)
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/CourseFiles/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Responses
Code	Description	Links
200	
OK

No links
Courses


POST
/api/Courses


Parameters
Try it out
No parameters

Request body

multipart/form-data
Title
string
Description
string
InstructorId
string($uuid)
EstimatedDurationHours
integer($int32)
IsActive
boolean
Price
number($double)
NumberOfSections
integer($int32)
imageFile
string($binary)
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Courses


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

GET
/api/Courses/{courseId}


Parameters
Try it out
Name	Description
courseId *
string($uuid)
(path)
courseId
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/Courses/{courseId}


Parameters
Try it out
Name	Description
courseId *
string($uuid)
(path)
courseId
Request body

multipart/form-data
Title
string
Description
string
EstimatedDurationHours
integer($int32)
IsActive
boolean
Price
number($double)
Image_form
string($binary)
NumberOfSections
integer($int32)
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/Courses/{courseId}


Parameters
Try it out
Name	Description
courseId *
string($uuid)
(path)
courseId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Courses/{courseId}/lessons


Parameters
Try it out
Name	Description
courseId *
string($uuid)
(path)
courseId
Responses
Code	Description	Links
200	
OK

No links
Enrollments


POST
/api/Enrollments/{studentId}/{courseId}


Parameters
Try it out
Name	Description
studentId *
string($uuid)
(path)
studentId
courseId *
string($uuid)
(path)
courseId
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "enrolledAt": "2026-08-11T22:12:50.750Z",
  "isActive": true,
  "paymentUrl": "string"
}
No links

GET
/api/Enrollments


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "enrolledAt": "2026-08-11T22:12:50.752Z",
    "isActive": true,
    "paymentUrl": "string"
  }
]
No links

GET
/api/Enrollments/{enrollmentId}


Parameters
Try it out
Name	Description
enrollmentId *
string($uuid)
(path)
enrollmentId
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "enrolledAt": "2026-08-11T22:12:50.754Z",
  "isActive": true,
  "paymentUrl": "string"
}
No links

PUT
/api/Enrollments/{enrollmentId}


Parameters
Try it out
Name	Description
enrollmentId *
string($uuid)
(path)
enrollmentId
Request body

application/json
Example Value
Schema
{
  "isActive": true
}
Responses
Code	Description	Links
200	
OK

Media type

text/plain
Controls Accept header.
Example Value
Schema
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "enrolledAt": "2026-08-11T22:12:50.759Z",
  "isActive": true,
  "paymentUrl": "string"
}
No links

DELETE
/api/Enrollments/{enrollmentId}


Parameters
Try it out
Name	Description
enrollmentId *
string($uuid)
(path)
enrollmentId
Responses
Code	Description	Links
200	
OK

No links
FawaterakCallbacks


GET
/api/fawaterak/payment-success


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

GET
/api/fawaterak/payment-failure


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links
FawaterakPayments


POST
/api/fawaterak/invoices


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "paymentMethodId": 0,
  "externalId": "string",
  "customer": {
    "customerId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "user@example.com",
    "phone": "string"
  },
  "cartItems": [
    {
      "name": "string",
      "price": 0.01,
      "quantity": 2147483647
    }
  ],
  "currency": "str",
  "payLoad": {
    "orderId": "string"
  },
  "redirectionUrls": {
    "onSuccess": "string",
    "onFailure": "string",
    "onPending": "string"
  }
}
Responses
Code	Description	Links
200	
OK

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "url": "string",
  "invoiceId": "string",
  "invoiceKey": "string"
}
No links
400	
Bad Request

Media type

application/json
Example Value
Schema
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "additionalProp1": "string",
  "additionalProp2": "string",
  "additionalProp3": "string"
}
No links

GET
/api/fawaterak/payment-methods


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

Media type

application/json
Controls Accept header.
Example Value
Schema
[
  {
    "id": 0,
    "paymentId": 0,
    "nameEn": "string",
    "nameAr": "string",
    "redirect": "string",
    "logo": "string"
  }
]
No links
204	
No Content

No links

POST
/api/fawaterak/pay


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "paymentMethodId": 0,
  "externalId": "string",
  "customer": {
    "customerId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "user@example.com",
    "phone": "string"
  },
  "cartItems": [
    {
      "name": "string",
      "price": 0.01,
      "quantity": 2147483647
    }
  ],
  "currency": "str",
  "payLoad": {
    "orderId": "string"
  },
  "redirectionUrls": {
    "onSuccess": "string",
    "onFailure": "string",
    "onPending": "string"
  }
}
Responses
Code	Description	Links
200	
OK

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "invoiceId": "string",
  "invoiceKey": "string"
}
No links
400	
Bad Request

Media type

application/json
Example Value
Schema
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "additionalProp1": "string",
  "additionalProp2": "string",
  "additionalProp3": "string"
}
No links

GET
/api/fawaterak/iframe-hash


Parameters
Try it out
Name	Description
domain
string
(query)
domain
Responses
Code	Description	Links
200	
OK

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
FawaterakWebhooks


POST
/api/fawaterak/webhooks/paid_json


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "invoice_id": 0,
  "invoice_key": "string",
  "hashKey": "string",
  "payment_method": "string",
  "invoice_status": "string",
  "pay_load": "string",
  "payload": {
    "OrderId": "string"
  }
}
Responses
Code	Description	Links
200	
OK

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
401	
Unauthorized

Media type

application/json
Example Value
Schema
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "additionalProp1": "string",
  "additionalProp2": "string",
  "additionalProp3": "string"
}
No links

POST
/api/fawaterak/webhooks/cancel


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "hashKey": "string",
  "referenceId": "string",
  "status": "string",
  "paymentMethod": "string",
  "pay_load": "string"
}
Responses
Code	Description	Links
200	
OK

No links
401	
Unauthorized

Media type

application/json
Example Value
Schema
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "additionalProp1": "string",
  "additionalProp2": "string",
  "additionalProp3": "string"
}
No links

POST
/api/fawaterak/webhooks/failed


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "hashKey": "string",
  "referenceId": "string",
  "status": "string",
  "paymentMethod": "string",
  "pay_load": "string"
}
Responses
Code	Description	Links
200	
OK

No links
401	
Unauthorized

Media type

application/json
Example Value
Schema
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "additionalProp1": "string",
  "additionalProp2": "string",
  "additionalProp3": "string"
}
No links
ForumPosts


GET
/api/ForumPosts/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/ForumPosts/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Request body

application/json
Example Value
Schema
{
  "content": "string",
  "isHelpful": true
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/ForumPosts/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Responses
Code	Description	Links
200	
OK

No links

POST
/api/ForumPosts


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "content": "string",
  "forumThreadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "parentPostId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links
ForumSubscriptions


GET
/api/ForumSubscriptions/my-subscriptions


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

POST
/api/ForumSubscriptions


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "forumThreadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/ForumSubscriptions/{threadId}


Parameters
Try it out
Name	Description
threadId *
string($uuid)
(path)
threadId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/ForumSubscriptions/is-subscribed/{threadId}


Parameters
Try it out
Name	Description
threadId *
string($uuid)
(path)
threadId
Responses
Code	Description	Links
200	
OK

No links
ForumThreads


GET
/api/ForumThreads


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

POST
/api/ForumThreads


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "title": "string",
  "description": "string"
}
Responses
Code	Description	Links
200	
OK

No links

GET
/api/ForumThreads/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/ForumThreads/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Request body

application/json
Example Value
Schema
{
  "title": "string",
  "description": "string"
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/ForumThreads/{id}


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Responses
Code	Description	Links
200	
OK

No links

GET
/api/ForumThreads/{id}/posts


Parameters
Try it out
Name	Description
id *
string($uuid)
(path)
id
Responses
Code	Description	Links
200	
OK

No links
ForumVoting


POST
/api/ForumVoting/{postId}/vote


Parameters
Try it out
Name	Description
postId *
string($uuid)
(path)
postId
value
integer($int32)
(query)
value
Responses
Code	Description	Links
200	
OK

No links

POST
/api/ForumVoting/thread/{threadId}/vote


Parameters
Try it out
Name	Description
threadId *
string($uuid)
(path)
threadId
value
integer($int32)
(query)
value
Responses
Code	Description	Links
200	
OK

No links

GET
/api/ForumVoting/{postId}/count


Parameters
Try it out
Name	Description
postId *
string($uuid)
(path)
postId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/ForumVoting/thread/{threadId}/count


Parameters
Try it out
Name	Description
threadId *
string($uuid)
(path)
threadId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/ForumVoting/{postId}/my-vote


Parameters
Try it out
Name	Description
postId *
string($uuid)
(path)
postId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/ForumVoting/thread/{threadId}/my-vote


Parameters
Try it out
Name	Description
threadId *
string($uuid)
(path)
threadId
Responses
Code	Description	Links
200	
OK

No links
Lessons


GET
/api/Lessons


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

POST
/api/Lessons


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "string",
  "content": "string",
  "orderIndex": 0,
  "durationMinutes": 0
}
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Lessons/{lessonId}


Parameters
Try it out
Name	Description
lessonId *
string($uuid)
(path)
lessonId
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/Lessons/{lessonId}


Parameters
Try it out
Name	Description
lessonId *
string($uuid)
(path)
lessonId
Request body

application/json
Example Value
Schema
{
  "title": "string",
  "content": "string",
  "orderIndex": 0,
  "durationMinutes": 0
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/Lessons/{lessonId}


Parameters
Try it out
Name	Description
lessonId *
string($uuid)
(path)
lessonId
Responses
Code	Description	Links
200	
OK

No links
Progress


GET
/api/Progress


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

POST
/api/Progress


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "enrollmentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Progress/{progressId}


Parameters
Try it out
Name	Description
progressId *
string($uuid)
(path)
progressId
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/Progress/{progressId}


Parameters
Try it out
Name	Description
progressId *
string($uuid)
(path)
progressId
Responses
Code	Description	Links
200	
OK

No links
QuestionOptions


POST
/api/QuestionOptions


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "text": "string",
  "isCorrect": true,
  "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links

GET
/api/QuestionOptions


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

GET
/api/QuestionOptions/{questionOptionId}


Parameters
Try it out
Name	Description
questionOptionId *
string($uuid)
(path)
questionOptionId
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/QuestionOptions/{questionOptionId}


Parameters
Try it out
Name	Description
questionOptionId *
string($uuid)
(path)
questionOptionId
Request body

application/json
Example Value
Schema
{
  "text": "string",
  "isCorrect": true
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/QuestionOptions/{questionOptionId}


Parameters
Try it out
Name	Description
questionOptionId *
string($uuid)
(path)
questionOptionId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/QuestionOptions/question/{questionId}


Parameters
Try it out
Name	Description
questionId *
string($uuid)
(path)
questionId
Responses
Code	Description	Links
200	
OK

No links
Questions


POST
/api/Questions


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "content": "string",
  "text": "string",
  "questionType": 1,
  "score": 0,
  "quizId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Questions


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

GET
/api/Questions/quiz/{quizId}


Parameters
Try it out
Name	Description
quizId *
string($uuid)
(path)
quizId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Questions/{questionId}


Parameters
Try it out
Name	Description
questionId *
string($uuid)
(path)
questionId
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/Questions/{questionId}


Parameters
Try it out
Name	Description
questionId *
string($uuid)
(path)
questionId
Request body

application/json
Example Value
Schema
{
  "content": "string",
  "questionType": 1,
  "score": 0
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/Questions/{questionId}


Parameters
Try it out
Name	Description
questionId *
string($uuid)
(path)
questionId
Responses
Code	Description	Links
200	
OK

No links
QuizAttempts


POST
/api/QuizAttempts


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "quizId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links

GET
/api/QuizAttempts


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

GET
/api/QuizAttempts/{quizAttemptId}


Parameters
Try it out
Name	Description
quizAttemptId *
string($uuid)
(path)
quizAttemptId
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/QuizAttempts/{quizAttemptId}


Parameters
Try it out
Name	Description
quizAttemptId *
string($uuid)
(path)
quizAttemptId
Request body

application/json
Example Value
Schema
{
  "totalScore": 0,
  "status": 1
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/QuizAttempts/{quizAttemptId}


Parameters
Try it out
Name	Description
quizAttemptId *
string($uuid)
(path)
quizAttemptId
Responses
Code	Description	Links
200	
OK

No links

POST
/api/QuizAttempts/{quizAttemptId}/submit


Quizzes


POST
/api/Quizzes


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "title": "string",
  "description": "string",
  "availableFrom": "2026-08-11T22:12:50.875Z",
  "availableTo": "2026-08-11T22:12:50.875Z",
  "durationMinutes": 0,
  "totalScore": 0,
  "passingScore": 0,
  "isPublished": true,
  "lessonId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Quizzes


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

No links

GET
/api/Quizzes/{quizId}


Parameters
Try it out
Name	Description
quizId *
string($uuid)
(path)
quizId
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/Quizzes/{quizId}


Parameters
Try it out
Name	Description
quizId *
string($uuid)
(path)
quizId
Request body

application/json
Example Value
Schema
{
  "title": "string",
  "description": "string",
  "availableFrom": "2026-08-11T22:12:50.881Z",
  "availableTo": "2026-08-11T22:12:50.881Z",
  "durationMinutes": 0,
  "totalScore": 0,
  "passingScore": 0,
  "isPublished": true
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/Quizzes/{quizId}


Parameters
Try it out
Name	Description
quizId *
string($uuid)
(path)
quizId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Quizzes/admin/{quizId}


Parameters
Try it out
Name	Description
quizId *
string($uuid)
(path)
quizId
Responses
Code	Description	Links
200	
OK

No links

POST
/api/Quizzes/{quizId}/publish


Parameters
Try it out
Name	Description
quizId *
string($uuid)
(path)
quizId
Responses
Code	Description	Links
200	
OK

No links
Reviews


GET
/api/Reviews/{reviewId}


Parameters
Try it out
Name	Description
reviewId *
string($uuid)
(path)
reviewId
Responses
Code	Description	Links
200	
OK

No links

PUT
/api/Reviews/{reviewId}


Parameters
Try it out
Name	Description
reviewId *
string($uuid)
(path)
reviewId
Request body

application/json
Example Value
Schema
{
  "rate": 0,
  "comment": "string"
}
Responses
Code	Description	Links
200	
OK

No links

DELETE
/api/Reviews/{reviewId}


Parameters
Try it out
Name	Description
reviewId *
string($uuid)
(path)
reviewId
Responses
Code	Description	Links
200	
OK

No links

GET
/api/Reviews/course/{courseId}


Parameters
Try it out
Name	Description
courseId *
string($uuid)
(path)
courseId
Responses
Code	Description	Links
200	
OK

No links

POST
/api/Reviews


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "rate": 0,
  "comment": "string",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Responses
Code	Description	Links
200	
OK

No links

POST
/api/Reviews/{reviewId}/reply


Parameters
Try it out
Name	Description
reviewId *
string($uuid)
(path)
reviewId
Request body

application/json
Example Value
Schema
{
  "reply": "string"
}
Responses
Code	Description	Links
200	
OK

No links

Schemas
AnswerDto
BasePaymentDataResponse
CancelTransactionModel
CartItemModel
CertificateDetailsDto
CertificateDto
CreateCertificateDto
CreateForumPostDto
CreateForumSubscriptionDto
CreateForumThreadDto
CreateLessonDto
CreateLessonProgressDto
CreateQuestionDto
CreateQuestionOptionDto
CreateQuizAttemptDto
CreateQuizDto
CreateReviewDto
CustomerModel
EInvoiceRequestModel
EInvoiceResponseDataModel
EnrollmentDto
InstructorReplyDto
InvoicePayload
LoginDto
PaymentMethod
ProblemDetails
QuestionType
QuizAttemptStatus
RedirectionUrlsModel
RegisterAdminDto
RegisterDto
SubmitAnswersRequest
UpdateEnrollmentDto
UpdateForumPostDto
UpdateForumThreadDto
UpdateLessonDto
UpdateQuestionDto
UpdateQuestionOptionDto
UpdateQuizAttemptDto
UpdateQuizDto
UpdateReviewDto
UserDetailsDto
UserDto
VerifyCertificateDto
WebHookModel
WebhookPayload