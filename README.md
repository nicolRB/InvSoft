Equipe:
- Nicolas Borges
- Gabriel da Silva

domínio de problemas:
- Listagem de inventário com nome de item, modelo, marca, código universal e quantidade
- Criação de listas e grupos de listas separadas
- Lista de comprar/pendência de items que precisam ser obtidos
- Registro de conta e login com senha usando token jwt
- HTML e CSS para front-end
- javascript e node para back-end
- Jest para testes do software
- MySQL para banco de dados

Requisitos Funcionais:
- O software deve poder armazenar informações inseridas pelo usuário em um banco de dados
- O software deve permitir o usuário a ver os dados armazenados de suas listas e poder alterá-los
- O software deve permitir o usuário a criar uma conta, armazenar os dados de diferentes contas e logar em uma conta com senha
- O software deve permitir criação, gerenciamento e configuração de listas e pastas de listas
- O software deve ter uma função de rastreamento de depreciação que pode ser configurada e aplicada à listas do usuário.

Requisitos Não-Funcionais:
- Token JWT para proteção de senhas.
- Registro de inserção, deleção ou alteração de dados não deve demorar mais que 200 ms.
- O JWT deve expirar em um tempo configurável e ser renovável por refresh tokens seguros.
- O tempo de resposta da API deve ser inferior a 500ms para consultas simples.
- O sistema deve suportar no mínimo 1000 requisições simultâneas sem degradação significativa.
- Operações críticas como listagem e busca devem ser otimizadas com índices no MySQL.
- O software deve ser feito para desktop.
- A navegação deve ser simples e compreensível
- Deve haver um sistema de backup automático do banco de dados.

Estratégia e planejamento:
- Sera usada a estratégia de arquitetura MVC, devido à sua simplicidade, conveniênvia e efetividade.
- HTML, CSS, Javascript, Node e MySQL serão usados por questão de afinidade e simplicidade.
- Jest sera usado por funcionar com Node e por ser fácil de configurar.
- A dupla trabalhará em conjunto para desenvolver todas as áreas do projeto.
- Plnaejamento será iniciado com Figma para o Front-end antes de ser feito a programação oficial, seguido do planejamento do banco de dados usando diagramas de classes.
- Após o planejamento ser finalizado, sera iniciado a programação do Front-end, junto da criação do banco de dados, sendo feito um display simples junto com o back-end necessário para poder manipular os dados a partir da interface de usuário antes os outros sistemas como registro e login de usuário e rastreamento de depreciação.
