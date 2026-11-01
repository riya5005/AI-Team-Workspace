# AI Team Workspace


A team task manager where you create workspaces, invite people, and track work on a simple project board. AI features are the next thing I'm building.

**Live demo:** https://client-flax-one-59.vercel.app
*(Hosted on free tiers, so the first load can take up to a minute while the server wakes up.)*


## What it does

- Register and log in securely
- Create workspaces and invite members by email
- Roles: **owner**, **admin**, **member**, each with different permissions
- Projects and a task board (To do, In progress, Done)
- Filter, sort and paginate tasks
- Activity log of who did what

## Tech stack

| Part | Tools |
|---|---|
| Frontend | React (Vite), React Router, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Auth and validation | bcrypt, JWT in httpOnly cookies, Zod |
| Hosting | Vercel (frontend), Render (backend) |

## Design decisions

- **httpOnly cookies for JWT**, so browser JavaScript can't read the token.
- **Every query is scoped to a workspace**, so one team can never see another team's data.
- **Indexes start with `workspace`**, matching how the app actually queries.
- **Vercel rewrites `/api` to the backend**, so the browser sees one domain and cookies work.
- **Activity logging never breaks the main action**; if it fails, the error is logged and the request continues.

## Run it locally

```bash
git clone https://github.com/riya5005/AI-Team-Workspace.git
cd AI-Team-Workspace

# Backend
cd server
npm install
# create server/.env with the variables below
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

`server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

The frontend runs on `http://localhost:5173` and proxies `/api` to the backend.

## Roadmap

- [x] Authentication and roles
- [x] Workspaces, projects, tasks
- [x] Activity log
- [x] Deployment
- [ ] AI task breakdown and weekly summaries
- [ ] Live updates with Socket.io
- [ ] Automated tests
- [ ] Drag and drop on the board

## Known limitations

- Free hosting means slow first load after inactivity.
- Members must register before they can be invited.

## Author

Riya, [GitHub](https://github.com/riya5005)
