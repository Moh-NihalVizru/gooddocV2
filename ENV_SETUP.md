# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# API Base URL
# This is the base URL for the authentication and API endpoints
VITE_API_BASE=https://innov-dev.beta.injomo.com

# Authentication Demo Mode
# Set to 'false' to disable demo credentials (gooddoc/123456)
# Defaults to 'true' for development
VITE_AUTH_DEMO=true
```

## Notes

- The `VITE_API_BASE` variable is used by the AuthService for all API calls
- If `VITE_API_BASE` is not set, it defaults to `https://innov-dev.beta.injomo.com`
- The `VITE_AUTH_DEMO` variable controls whether demo credentials are enabled
- Make sure to restart your development server after creating or modifying the `.env` file
