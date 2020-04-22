import { Controller, Get } from '@nestjs/common';
import { NamespaceService } from './namespace.service';

@Controller('namespace')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}
}
