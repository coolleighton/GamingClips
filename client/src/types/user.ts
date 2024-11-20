export interface UserData {
  _id: string;
  username: string;
  email: string;
  password: string;
  accountSetup: boolean;
  videos?: Array<{
    _id: string;
    title: string;
    url: string;
    cloudinaryId: string;
    uploadDate: Date;
  }>;
}
