import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../service/product.service';
import { Product } from '../../model/entity/product';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/service/cart.service';
import { CartItem } from 'src/app/model/entity/cart-item';
import { AuthService } from 'src/app/service/auth.service';
import { LoginResponse } from 'src/app/model/dto/login-response';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[];
  page: number = 1;
  size: number = 12;
  totalElemets: number = 0;
  isPageFullLoaded: boolean = false;
  isSearchMode: boolean = false;
  isLoggedChange: boolean = false;
  account: LoginResponse;

  currentCategoryId: number;
  previousCatgoryId: number;

  searchWord: string;

  previousSortedParam: string;

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedChange
      .subscribe(data => {
        this.isLoggedChange = data;
        this.account = this.authService.getAccount();
      });
    this.activatedRoute.params.subscribe(() => {
      this.showListProducts();
    });
  }

  showListProducts() {
    const hasSearch: boolean = this.activatedRoute.snapshot.paramMap.has('name');
    const hasCategoryId: boolean = this.activatedRoute.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      this.showListProdutsByCategory();
    } else if (hasSearch) {
      this.showListProductsBySearch();
    } else {
      this.showListProductsBySort();
    }
  }

  showListProductsBySort() {
    const sortedParam = this.activatedRoute.snapshot.params.type;
    if (sortedParam != this.previousSortedParam) {
      this.size = 12;
      this.isPageFullLoaded = false;
    }
    this.previousSortedParam = sortedParam;
    switch (sortedParam) {
      case 'from-cheap-to-expensive':
        this.productService.getProductsSorterByPriceAsc(this.page, this.size)
          .subscribe(this.proceedResult());
        break;
      case 'from-expensive-to-cheap':
        this.productService.getProductsSorterByPriceDesc(this.page, this.size)
          .subscribe(this.proceedResult());
        break;
      case 'by-name':
        this.productService.getProductsSorterByName(this.page, this.size)
          .subscribe(this.proceedResult());
        break;
      default:
        this.showAllListProducts();
    }
  }

  showListProductsBySearch() {
    this.searchWord = this.activatedRoute.snapshot.params.name;
    this.productService.getProductBySearch(this.searchWord, this.page, this.size)
      .subscribe(this.proceedResult());
  }

  showListProdutsByCategory() {
    this.currentCategoryId = this.activatedRoute.snapshot.params.id;
    if (this.currentCategoryId != this.previousCatgoryId) {
      this.size = 12;
      this.isPageFullLoaded = false;
    }
    this.previousCatgoryId = this.currentCategoryId;
    this.productService.getProductsByCategory(this.currentCategoryId, this.page, this.size)
      .subscribe(this.proceedResult());
  }

  showAllListProducts() {
    this.productService.getProducts(this.page, this.size)
      .subscribe(this.proceedResult());
  }

  onAddToCart(product: Product) {
    const cartItem: CartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }

  loadMore() {
    if (this.totalElemets > this.size) {
      this.size += 12;
      this.showListProducts();
      console.log(this.totalElemets);
      console.log(this.size);
      if (this.totalElemets < this.size) {
        this.isPageFullLoaded = true;
      }
    }
  }

  private proceedResult() {
    return data => {
      this.products = data.content;
      this.totalElemets = data.totalElements;
    }
  }

}
