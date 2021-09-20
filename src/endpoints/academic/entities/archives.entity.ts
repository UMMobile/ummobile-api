export class Archive {
  id: String;
  name: String;
  images: ArchiveImg[];
}

class ArchiveImg {
  page: Number;
  image: String;
}