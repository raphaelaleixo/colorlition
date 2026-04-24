import { useParams } from 'react-router-dom';

export default function JoinPage() {
  const { id } = useParams();
  return <div>JoinPage {id ? `— room ${id}` : ''}</div>;
}
