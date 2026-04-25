import BigScreenPage from './BigScreenPage';
import { GameContext } from '../contexts/GameContext';
import { buildMockGameContextValue } from '../mocks/colorlitionFixture';

export default function MockBigScreen() {
  return (
    <GameContext.Provider value={buildMockGameContextValue()}>
      <BigScreenPage />
    </GameContext.Provider>
  );
}
