import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SupplierPortalAuthGuard extends AuthGuard('supplier-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
