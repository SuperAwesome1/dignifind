# Deployment Guide: Dignifind Admin

This document outlines the steps to deploy the Dignifind Admin application to an Apache web server, specifically to be served from the subfolder `/admin/v2/`.

## Prerequisites

1.  **Node.js & npm**: Ensure you have a compatible version of Node.js installed to build the project.
2.  **Apache Web Server**: With `mod_rewrite` enabled.

## 1. Build the Application

Because the application will be hosted in a subfolder (`/admin/v2`), you must specify the base href during the build process so that all assets and routing resolve correctly.

Run the following command from the `dignifind-admin` directory:

```bash
npm run build -- --base-href=/admin/v2/
```

*Note: Depending on your Angular version and builder configuration, the compiled files will be located in the `dist/dignifind-admin/browser/` directory.*

## 2. Configure Apache for Angular Routing

Angular is a Single Page Application (SPA). For direct navigation and page refreshes to work correctly without returning a `404 Not Found` error from Apache, you must redirect all requests to `index.html`.

1.  Navigate to your Apache `htdocs` or `/var/www/html` public directory.
2.  Create the essential folder structure if it doesn't already exist:
    ```bash
    mkdir -p admin/v2
    ```
3.  Inside the `/admin/v2/` directory on your server, create a file named `.htaccess` and add the following configuration:

    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      # Set the base path to our subfolder
      RewriteBase /admin/v2/
      
      # Don't rewrite if the request is for index.html
      RewriteRule ^index\.html$ - [L]
      
      # If the requested file or directory doesn't exist, redirect to index.html
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /admin/v2/index.html [L]
    </IfModule>
    ```

## 3. Deploy the Files

1.  Copy all the contents from your local `dist/dignifind-admin/browser/` folder (generated in Step 1).
2.  Upload/paste them into the `/admin/v2/` directory on your Apache server.
3.  Ensure that the `.htaccess` file created in Step 2 is also present alongside `index.html`.

## 4. Verify the Deployment

1.  Open your web browser.
2.  Navigate to `https://yoursite.com/admin/v2/` (replace `yoursite.com` with your actual domain).
3.  Ensure the application loads, assets (images, CSS, JS) load without 404s, and that you can navigate between routes. Try reloading a sub-route (e.g. `https://yoursite.com/admin/v2/some-page`) to verify that the `.htaccess` fallback to `index.html` is working successfully.
