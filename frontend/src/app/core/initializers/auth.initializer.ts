import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export function initAuth(auth: AuthService) {
  return () => firstValueFrom(auth.loadMe());
}
