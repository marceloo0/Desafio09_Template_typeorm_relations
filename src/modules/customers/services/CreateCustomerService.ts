import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}
// injeção de dependencias
@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    // verifico se o email existe na base de dados
    const checkCustomers = await this.customersRepository.findByEmail(email);
    // se existir retorno msg
    if (checkCustomers) {
      throw new AppError('This e-mail is already registered');
    }

    // crio e salvo o cliente usando o repositorio
    const customer = await this.customersRepository.create({
      name,
      email,
    });

    // retorno o repositorio para o controller
    return customer;
  }
}

export default CreateCustomerService;
