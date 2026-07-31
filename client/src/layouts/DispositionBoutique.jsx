import { Outlet } from 'react-router-dom';
import EnTete from '../components/EnTete';
import PiedDePage from '../components/PiedDePage';

export default function DispositionBoutique() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <EnTete />
      <main className="flex-1">
        <Outlet />
      </main>
      <PiedDePage />
    </div>
  );
}
