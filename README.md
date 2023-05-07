<p align="center">
  <img width="200" src="/public/images/mindescape logo.png">
</p>

# Content Management System

👋 **Welcome to the public version of my repo.**

I am featuring my full stack web application. I split the project documentation into the following sections:

1. About
2. Tech Stack
3. Functionalities
4. Security
5. Optimization
6. API routes
7. UI Design
8. Final Considerations

---

**👉 Would you like to try out this application as the admin? Feel free to sign in with the credentials.**

[🔗 Mindescape CMS](https://mindescape-cms.vercel.app/)

📧login: mindescape.contact@gmail.com
🗝password: mindescapetestcms!

---

## 1. About ⚡

Mindescape CMS is a custom content management system built for any blog-type website. Fully responsive, optimized & designed for mobile devices. 

Mindescape comes from the words (mind + escape) and is the brand that supports worldwide contemporary independent artists. Any blog-type web application requires some management system where you can publish/save drafts/edit/remove articles, manage comments, users, etc. It's what my custom CMS is developed for.

Despite the name and current application branding, my CMS can easily be transformed, customized, and plugged into any other brand/web application. You will find information about the capabilities of the application in the following sections.

## 2. Tech Stack

| Frontend | Backend | Database | Storage  | Design           | Libraries/other                 |
| -------- | ------- | -------- | -------- | ---------------- | ------------------------------- |
| Next.js  | Next.js | MongoDB  | Firebase | Figma            | NextAuth                        |
| React    |         |          |          | Font Awesome     | tinyMCE                         |
| Sass     |         |          |          | Unsplash         | Bcrypt                          |
|          |         |          |          | app.diagrams.net | Nodemailer                      |
|          |         |          |          |                  | Nodemailer-juice                |
|          |         |          |          |                  | Lodash                          |
|          |         |          |          |                  | Ipware                          |
|          |         |          |          |                  | Super strong password generator |

Production server - Vercel

## 3. Functionalities

In this section I will point the CMS core functionalities. Below I present a high-level overview in the form of a flowchart.

<p align="center">
  <img src="/public/images/flowchart.png">
</p>

## 4. Security

Application security is the point that I focused on the most in the development of the entire application, right next to functionality.

### NextAuth

NextAuth.js is a complete open-source authentication solution for Next.js applications. NextAuth.js by default uses **JSON Web Tokens** for saving the user's session. Advantages of using a JWT as a session token include that they do not require a database to store sessions, this can be faster and cheaper to run and easier to scale. You can use JWT to securely store information you do not mind the client knowing even without encryption, as the JWT is stored in a server-readable-only cookie so data in the JWT is not accessible to third party JavaScript running on our site.

[@NextAuth documentation](https://next-auth.js.org/getting-started/introduction)

### Account Recovery

I came up with my own account recovery flow which seems to be completely safe. Below I am presenting a high-level overview of how the account recovery process has been implemented.

<p align="center">
  <img src="/public/images/account recovery.png">
</p>

_Password recovery email example_

<p align="center">
  <img src="/public/images/email scr.png">
</p>

### User roles

Depending on the role, the final user interface look will differ. If `!isAuthenticated`, the user will always be redirected to `/auth` page.

|     |                                                | Admin | Editor |
| --- | ---------------------------------------------- | ----- | ------ |
| 1.  | Publish article to public                      | true  | true   |
| 2.  | Save as draft                                  | true  | true   |
| 3.  | Access drafts from various writers             | true  | false  |
| 4.  | Edit drafts from various writers               | true  | false  |
| 5.  | Remove drafts from various writers             | true  | false  |
| 6.  | Remove my own draft                            | true  | true   |
| 7.  | Access published articles from various writers | true  | true   |
| 8.  | Edit published articles from various writers   | true  | false  |
| 9.  | Remove published articles from various writers | true  | false  |
| 10. | Remove my own article                          | true  | true   |
| 11. | Check comments for all articles                | true  | true   |
| 12. | Remove any comment                             | true  | false  |
| 13. | Check subscribers                              | true  | false  |
| 14  | Check messages                                 | true  | false  |
| 15. | Remove messages                                | true  | false  |
| 16. | Reply to messages                              | true  | false  |
| 17. | Check all users                                | true  | true   |
| 18. | Contact any user                               | true  | true   |
| 19. | Add new user                                   | true  | false  |
| 20. | Change my user data (name, credentials etc.)   | true  | true   |

### API Routes

Most of the API Routes are private - not accessible if `!isAuthenticated` or `token.role !== 'admin'`. I was very strict and specific with declaring what routes are accessible and for whom. Also what kind of data is retrieved because depending on the role, or `!isAuthenticated`, the retreived data can differ (hiding some sensitive data). I am specifically writing about API routes in Section 6.

### Rate Limit Middleware

Rate limiting is a strategy for limiting network traffic and stopping potential API abuse. Every API route has its own `rateLimiter` variable that stores user requests `timestamps` - that's all in a nutshell.

`10` is the number of allowed requests per minute per each API route.

### User Data

The user password is hashed with the help of Bcrypt library. The encrypted password is then saved in the database. None of the sensitive user data is exposed to public via API requests.

### Environment Variables

All secret keys, credentials etc. are stored in `.env.local` file.

## 5. Optimization

### Firebase storage

Optimization has played a huge role, especially in the area of storing files like photos.

When it comes to blogging, you always want to attach some images. Firebase storage is a great and secure way to store files while overloading the database with files is the worst possible solution. After publishing several articles, it could run out of free space, right next to performance issues. Any images that are uploaded, **including TinyMCE Rich Text Editor -> upload file feature** are stored in the Firebase storage.

Upload files requests are sent to `/api/image` endpoint with a `POST` request.

Below I am presenting a high-level flowchart. It lacks a lot of implementation details but it just highlights the concept.

<p align="center">
  <img src="/public/images/firebase.png">
</p>

### Image component by Next.js

Thanks to Next.js amazing feature, I used the `<Image/>` component to lazy load images in `.webp` format.

- Improved performance
- Faster Page Loads

### General code optimization

I did my best to keep the source code clean and easy to maintain. The file structure seems to be friendly and easy to get your head around.

The source code was optimized on an ongoing basis in the context of no repetition, as much as I could. A functions that perform repetitive tasks have been outsourced to utils. The custom hooks like `useHttp`, or `useImageUpload` have been created to perform and process requests according to the requirements and needs of the application.

I memoized the functions that needed to be passed as dependencies to the `useEffect` function to avoid unnecessary re-renders. That's in a nutshell.

## 6. API Routes

Please note that `admin` will have access to all private routes, while `editor` may not have access. The table below shows all API endpoints and indicates those that are public.

| Route                                   | Methods          | Public | Notes                                                         |
| --------------------------------------- | ---------------- | ------ | ------------------------------------------------------------- |
| /api/articles                           | GET, POST, PATCH | GET    | When a public `fetch` request, the data returned will differ. |
| /api/article-id/{id}                    | DELETE           | null   |                                                               |
| /api/article-title/{article-title}      | GET              | All    |                                                               |
| /api/author-id/{id}                     | GET              | All    |                                                               |
| /api/comments/${articleId}/             | POST             | All    |                                                               |
| /api/comments/${articleId}/${commentId} | DELETE           | null   |                                                               |
| /api/drafts                             | GET, POST, PATCH | null   |                                                               |
| /api/drafts/${articleId}                | DELETE           | null   |                                                               |
| /api/drafts/${articleTitle}             | GET              | null   |                                                               |
| /api/messages                           | GET, POST, PATCH | POST   |                                                               |
| /api/messages/${messageId}              | DELETE           | null   |                                                               |
| /api/newsletter                         | GET, POST        | POST   |                                                               |
| /api/password-recovery                  | POST, PATCH      | All    |                                                               |
| /api/password-recovery/resend-link      | POST             | All    |                                                               |
| /api/users                              | GET, POST        | null   |                                                               |
| /api/users/${userId}                    | PATCH, DELETE    | null   |                                                               |
| /api/image                              | POST             | null   |                                                               |

## 7. UI Design

Fully responsive, optimized & designed for mobile devices. I designed an interface that is clear and user-friendly. Everything is intuitive and easy to understand. In the case of irreversible decisions, the user will be greeted by a modal confirming, for example, the permanent removal of an item from the database. Below I present the selected application screenshots. Feel free to sign in with the shared credentials and test the application by yourself.

<p align="center">
  <img src="/public/images/ui.png">
</p>

## 8. Final Considerations 💭

I am pleased that I have accomplished that much. There's still plenty of room for improvement or other functionality development. I feel like this CMS is a perfect complex base and based on requirements, it can be easily adjusted and a lot of different features implemented.

One additional functionality that could be implemented is filtering. E.g. filtering published articles, messages, users etc. The more data, the more this functionality could be useful. Filtering is quite simple to implement and, depending on what we would like to filter, it can be done at any time.

At the planning stage of the application, I didn't think that I would implement so many different functionalities, especially in the area of security. The longer the project went on, the more excited I felt about the new solutions, and I couldn't even imagine the project without implementing them. Long story short, this project was an amazing experience!
