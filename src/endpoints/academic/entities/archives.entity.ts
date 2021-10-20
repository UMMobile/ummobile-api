export class Archive {
  id: number;
  name: string;
  images: ArchiveImg[];
}

class ArchiveImg {
  page: number;
  image: string;
}