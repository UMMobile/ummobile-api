export class Document {
  id: number;
  name: string;
  images: DocumentImg[];
}

class DocumentImg {
  page: number;
  image: string;
}