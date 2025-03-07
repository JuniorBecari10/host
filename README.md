# Host

A web app for managing hotels. It's very simple to setup and use.

## Project Overview

Host is a lightweight hotel management web app designed to help managing hotel reservations, rooms, and customer information with ease.

## Installation

```sh
npm install
npm start
```

If you are running this in a test environment, it'll create a new `.env` file automatically. <br>
Databases are managed using `.json` files; they're created automatically as needed too.

## Environment Configuration
For production, set up your `.env` file with the following variables:

- `SECRET_KEY`: The key used to generate JWT tokens;
- `PORT`: The port the application will run on (default: `8080`).

Remind that on non-production environments this file is created automatically with the `SECRET_KEY` set to a random string and the `PORT` set to the default one (`8080`).

## Administrator Access

The software has one Administrator account defined by default. <br />
It has these credentials to log into:

E-mail: `admin@admin.adm` <br />
Password: `Bj9G!%pVf*#lH5K@1Xq_`

## Contributing

Contributions are welcome! Please open an issue to discuss potential improvements or submit a pull request.

## License

See `LICENSE` file.
