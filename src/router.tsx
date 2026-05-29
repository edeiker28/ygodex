import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Cards from './pages/Cards';
import CardDetail from './pages/CardDetail';
import Decks from './pages/Decks';
import DeckBuilder from './pages/DeckBuilder';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'cards', element: <Cards /> },
      { path: 'cards/:id', element: <CardDetail /> },
      { path: 'decks', element: <Decks /> },
      { path: 'decks/:id', element: <DeckBuilder /> },
    ],
  },
]);
