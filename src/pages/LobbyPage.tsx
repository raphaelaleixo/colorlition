import { useParams } from 'react-router-dom';

export default function LobbyPage() {
  const { id } = useParams();
  return <div>LobbyPage — room {id}</div>;
}
