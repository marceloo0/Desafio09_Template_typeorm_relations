import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // criar o produto
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    // salva o produto
    await this.ormRepository.save(product);

    // retorna o produto salvo
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // verifica se tem um produto com o mesmo nome
    const findproduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    // retorna o produto encontrado
    return findproduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productIdsList = products.map(product => product.id);

    const orderListIds = await this.ormRepository.find({
      id: In(productIdsList),
    });

    if (productIdsList.length !== orderListIds.length) {
      throw new AppError('Missing product');
    }

    return orderListIds;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsData = await this.findAllById(products);
    const newProducts = productsData.map(productData => {
      const productFind = products.find(
        product => product.id === productData.id,
      );
      if (!productFind) {
        throw new AppError('product not find');
      }

      if (productData.quantity < productFind.quantity) {
        throw new AppError('Insufficient product quantity');
      }

      const newProduct = productData;

      newProduct.quantity -= productFind.quantity;

      return newProduct;
    });

    await this.ormRepository.save(newProducts);

    return newProducts;
  }
}

export default ProductsRepository;
