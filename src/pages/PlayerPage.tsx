import { useParams } from 'react-router-dom';

export default function PlayerPage() {
  const { id, playerId } = useParams();
  return <div>PlayerPage — room {id}, player {playerId}</div>;
}
