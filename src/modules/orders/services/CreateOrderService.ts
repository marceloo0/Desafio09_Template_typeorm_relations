import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    const productsIds = products.map(product => {
      return { id: product.id };
    });

    const productsData = await this.productsRepository.findAllById(productsIds);

    const productsFinal = productsData.map(productData => {
      const productFinal = products.find(
        productFind => productFind.id === productData.id,
      );

      return {
        product_id: productData.id,
        price: productData.price,
        quantity: productFinal?.quantity || 0,
      };
    });

    await this.productsRepository.updateQuantity(products);

    const order = await this.ordersRepository.create({
      customer,
      products: productsFinal,
    });

    return order;
  }
}

export default CreateOrderService;
