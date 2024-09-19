import { Injectable } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathroom: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        listed_date: true,
        land_size: true,
        property_type: true,
        images: { select: { url: true }, take: 1 },
      },
    });

    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async createHome({
    address,
    numberOfBedrooms,
    numberOfBathroom,
    city,
    price,
    landSize,
    propertyType,
    images,
  }: CreateHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bedrooms: numberOfBedrooms,
        number_of_bathrooms: numberOfBathroom,
        city,
        price,
        land_size: landSize,
        property_type: propertyType,
        realtor_id: 5,
      },
    });

    const homeImages = images.map((image) => {
      return {
        ...image,
        home_id: home.id,
      };
    });

    await this.prismaService.image.createMany({ data: homeImages });

    return new HomeResponseDto(home);
  }
}
