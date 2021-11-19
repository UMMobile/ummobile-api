// TODO (@jonathangomz): Delete images field on a version update
export class Document {
  id: number;
  name: string;
  images: DocumentImg[];
  pages: DocumentPage[];
}

export class DocumentImg {
  page: number;
  image?: string;
  urlImage: string;
}

export class DocumentPage{
  page: number;
  base64?: string;
  urlImage?: string;
}