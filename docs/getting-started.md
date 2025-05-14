# Getting Started

This guide will help you set up and run the Royal FC Asaba All-Stars Club website project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v20 or later)
2. **npm** (v9 or later) or **yarn**
3. **Git** for version control
4. **PostgreSQL** (optional for local development, as the project can use in-memory storage)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Royal-FC
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Database connection (optional for development)
DATABASE_URL=postgresql://username:password@localhost:5432/royalfc

# Server configuration
PORT=5000
NODE_ENV=development

# Admin credentials (for development only)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password123
```

## Running the Project

### Development Mode

To start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the server at `http://localhost:5000` with hot reloading enabled.

### Production Build

To create a production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Project Structure

Understanding the project structure will help you navigate and contribute effectively:

```
Royal FC/
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main application component
│   └── index.html          # HTML entry point
├── server/                 # Backend code
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage implementation
│   └── index.ts            # Server entry point
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
├── docs/                   # Documentation
└── attached_assets/        # Static assets
```

## Key Technologies

### Frontend

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **React Query**: Data fetching and state management
- **Wouter**: Lightweight routing

### Backend

- **Express.js**: Web framework
- **Drizzle ORM**: Database ORM
- **PostgreSQL**: Database (optional)
- **Zod**: Schema validation

## Development Workflow

### 1. Running the Server

The development server runs both the frontend and backend:

```bash
npm run dev
```

### 2. Making Changes

- Frontend changes are in the `client/src` directory
- Backend changes are in the `server` directory
- Shared types and schemas are in the `shared` directory

### 3. API Development

When creating new API endpoints:

1. Define the route in `server/routes.ts`
2. Implement the logic in `server/storage.ts`
3. Add types to `shared/schema.ts` if needed
4. Use React Query to fetch data in the frontend

Example:

```typescript
// server/routes.ts
app.get("/api/my-endpoint", async (req, res) => {
  try {
    const data = await storage.myFunction();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

// client/src/components/MyComponent.tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/my-endpoint'],
});
```

### 4. Component Development

When creating new components:

1. Create the component in `client/src/components`
2. Use TypeScript interfaces for props
3. Implement the component using Tailwind CSS for styling
4. Import and use the component in pages or other components

Example:

```tsx
// client/src/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

const MyComponent = ({ title, children }: MyComponentProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-royal-blue mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default MyComponent;
```

## Database Setup

### Using In-Memory Storage (Development)

By default, the project uses in-memory storage for development, which doesn't require a database.

### Using PostgreSQL (Optional)

To use PostgreSQL:

1. Install PostgreSQL and create a database
2. Update the `DATABASE_URL` in your `.env` file
3. Run database migrations:

```bash
npm run db:push
# or
yarn db:push
```

## Testing

Currently, the project doesn't have automated tests. This is an area for future improvement.

## Deployment

### Deploying to Replit

The project is configured for deployment on Replit:

1. Create a new Replit project
2. Import the repository
3. Set up environment variables in the Replit Secrets panel
4. The `.replit` file configures the run command

### Deploying to Other Platforms

To deploy to other platforms:

1. Build the project: `npm run build`
2. Set up environment variables
3. Start the server: `npm run start`

## Common Issues and Solutions

### "Module not found" errors

If you encounter module not found errors:

```bash
npm install
# or
yarn install
```

### Database connection issues

If you have trouble connecting to the database:

1. Check your `DATABASE_URL` in the `.env` file
2. Ensure PostgreSQL is running
3. Try using in-memory storage for development

### Port already in use

If port 5000 is already in use:

1. Change the `PORT` in your `.env` file
2. Or kill the process using the port:
   ```bash
   npx kill-port 5000
   ```

## Additional Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)

## Contributing

See the [README.md](../README.md) file for contribution guidelines.
