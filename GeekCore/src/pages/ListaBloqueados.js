import { ListaBloqueados as ListaBloqueadosComponent } from '../components/ListaBloqueados';
import { Container } from '../components/Container';

export function ListaBloqueados() {
  return (
    <Container>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ListaBloqueadosComponent />
        </div>
      </div>
    </Container>
  );
}
