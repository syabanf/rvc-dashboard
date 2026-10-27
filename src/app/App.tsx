import { lazy, Suspense } from 'react'
import { createBrowserRouter, Link, RouterProvider } from 'react-router'
import { btn } from '../ui/ui'
import { Shell } from './Shell'
import { StoreProvider } from './store'

const Home = lazy(() => import('../features/home/Home'))
const Photos = lazy(() => import('../features/photos/Photos'))
const Videos = lazy(() => import('../features/videos/Videos'))
const Merch = lazy(() => import('../features/merch/Merch'))
const Shows = lazy(() => import('../features/shows/Shows'))
const ShowDetail = lazy(() => import('../features/shows/ShowDetail'))
const Events = lazy(() => import('../features/events/Events'))
const Rsvp = lazy(() => import('../features/rsvp/Rsvp'))
const Raw = lazy(() => import('../features/raw/Raw'))
const Admin = lazy(() => import('../features/admin/AdminLayout'))
const AdminOverview = lazy(() => import('../features/admin/Overview'))
const AdminEvents = lazy(() => import('../features/admin/EventsPage'))
const AdminBookings = lazy(() => import('../features/admin/BookingsPage'))
const AdminMerch = lazy(() => import('../features/admin/MerchPage'))
const AdminMembers = lazy(() => import('../features/admin/MembersPage'))

function NotFound() {
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-[1440px] place-items-center px-4 text-center">
      <div className="space-y-6">
        <h1 className="font-display text-7xl">404</h1>
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Nothing here. Yet.</p>
        <Link to="/" className={btn('line')}>
          Back home
        </Link>
      </div>
    </section>
  )
}

const router = createBrowserRouter([
  {
    path: 'admin',
    element: (
      <Suspense fallback={<div className="h-dvh bg-void" />}>
        <Admin />
      </Suspense>
    ),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'events', element: <AdminEvents /> },
      { path: 'bookings', element: <AdminBookings /> },
      { path: 'merch', element: <AdminMerch /> },
      { path: 'members', element: <AdminMembers /> },
    ],
  },
  {
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'photos', element: <Photos /> },
      { path: 'videos', element: <Videos /> },
      { path: 'merch', element: <Merch /> },
      { path: 'shows', element: <Shows /> },
      { path: 'shows/:id', element: <ShowDetail /> },
      { path: 'events', element: <Events /> },
      { path: 'rsvp', element: <Rsvp /> },
      { path: 'raw', element: <Raw /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  )
}
