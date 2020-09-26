import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    // verifica o nome do produto utilizando o função no repositorio do produto
    const checkProduct = await this.productsRepository.findByName(name);

    // retorna se msg se existe
    if (checkProduct) {
      throw new AppError('Product already registered');
    }

    // chama a função create no repositorio e envia os dados para serem gravados no banco
    const product = await this.productsRepository.create({
      name,
      price,
      quantity,
    });

    // retorna o produto salvo para o controller
    return product;
  }
}

export default CreateProductService;
