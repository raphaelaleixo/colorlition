import { useParams } from 'react-router-dom';

export default function BigScreenPage() {
  const { id } = useParams();
  return <div>BigScreenPage — room {id}</div>;
}
