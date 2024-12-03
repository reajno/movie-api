## Testing and limitations

In this application, endpoints as outlined by the assignment task has been implemented in full. These functionalities are as follows:

- Perform SQL database queries: Testing of valid and invalid queries with values obtained from endpoint request object.

- User Registration: Tested with valid and invalid email/password combinations. Password appropriately hashed prior to database insertion.

- Login Endpoint: Tested with correct and incorrect email/password combinations. Securely match password input and generate signed JWT to response header.

- Image Upload: Tested image uploads with different formats, sizes, and missing or invalid data. Validate user authorisation and record of movie ID in database.

- Image Retrieval: Tested retrieval of user uploaded image from the database. Provide error handling for non-existent images and invalid movie ID.

- Request Validation: Tested validation middleware functions to handle erroneous URL parameters and queries.

- User Authentication: JWT signed and sent as response Bearer token by the server. User validation middleware created to check Authorization request header

Tested session storage to store server generated JWT. including invalid or expired tokens.


The application is designed to handle common errors and edge cases while maintaining system stability. To manage database and API failures, it returns meaningful error messages to the user which ensures the user experience is not disrupted. Invalid data submissions such as non-image files and empty input fields are also handled gracefully using custom validation middleware. While not all errors have been accounted for, future application enhancements can be implemented for stricter validation rules. Examples of this include email format verification, and password length and complexity requirements during user registration.

Service Failures and API Limitations

Because the database is stored in a local MySQL database, the API may fail if the SQL connection is not running. This will result in a server error. Some limitations were put in place for security reasons. For example, the API only expects PNG image files. While formats such as JPG and GIF are valid files, this was done to streamline the database files and avoid malicious files from being uploaded. 

In the future, retry mechanisms and fallbacks could be implemented to handle intermittent service failures.

The API relies on a local MySQL database connection, where service interruptions result in server errors. For security purposes, the system only accepts PNG image files, excluding other valid formats like JPG and GIF. This restriction helps maintain database consistency and prevents malicious file uploads. Future improvements will include implementing retry mechanisms and fallback options to better handle temporary service disruptions.
