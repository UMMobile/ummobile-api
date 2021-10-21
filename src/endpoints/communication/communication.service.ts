import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, Observable } from 'rxjs';
import { UtilsService } from 'src/utils/utils.service';
import { Post } from './entities/post.entity';

@Injectable()
export class CommunicationService {
  constructor(
    private readonly http: HttpService,
    private readonly utils: UtilsService,
  ){}
  
  /**
   * Fetches the institutional news.
   * @param quantity The quantity of posts to fetch.
   * @return An observable with a list of `Post`.
   */
  fetchNews(quantity: number): Observable<Post[]> {
    return this.fetchPosts('noticias', quantity);
  }

  /**
   * Fetches the institutional events.
   * @param quantity The quantity of posts to fetch.
   * @return An observable with a list of `Post`.
   */
  fetchEvents(quantity: number): Observable<Post[]> {
    return this.fetchPosts('eventos', quantity);
  }

  /**
   * Fetches the institutional blog.
   * @param quantity The quantity of posts to fetch.
   * @return An observable with a list of `Post`.
   */
  fetchBlog(quantity: number): Observable<Post[]> {
    return this.fetchPosts('blog', quantity);
  }

  private fetchPosts(path: string, quantity: number = 14): Observable<Post> {
  private fetchPosts(path: string, quantity: number = 14): Observable<Post[]> {
    return this.http.get(`/${path}/feed/${quantity}`).pipe(
      map(({data}) => data['post'] ? data['post'].map((post: any) => this.mapPost(post)) : []),
      catchError(this.utils.handleHttpError<Post[]>([])),
    );
  }

  private mapPost(data: {}): Post {
    let url: string = data['URL'];

    // Some URLs are just the path so this helps to form the complete URL.
    if(!url.startsWith('http') && !url.startsWith('#')){
      url = `https://conectate.um.edu.mx/articulo/${url}`;
    }

    return {
      title: data['TITULO'],
      image: data['IMAGEN'],
      url,
    };
  }
}
