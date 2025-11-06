import {injectable} from 'inversify';
import {Prisma, User} from '@prisma/client';
import {IUserRepository} from '../interfaces/repositories/IUserRepository';
import {prisma} from '../config/database';

/**
 * User Repository Implementation
 * Handles data access for User entity using Prisma
 */
@injectable()
export class UserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {id},
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {email},
        });
    }

    async findByPhone(phone: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {phone},
        });
    }

    async findByEmailOrPhone(email: string, phone?: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                OR: [
                    {email},
                    ...(phone ? [{phone}] : []),
                ],
            },
        });
    }

    async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
        return prisma.user.create({
            data: {
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                username: `${data.first_name}_${data.last_name}`,
                password: data.password,
                phone: data.phone,
            },
        });
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        return prisma.user.update({
            where: {id},
            data,
        });
    }

    async remove(id: string): Promise<void> {
        await prisma.user.delete({
            where: {id},
        });
    }

    async isActive(id: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: {id},
            select: {isActive: true},
        });
        return user?.isActive ?? false;
    }

    async findByIdWithWallet(id: string): Promise<Prisma.UserGetPayload<{ include: { wallet: true } }>|null> {
        return prisma.user.findUnique({
            where: {id},
            include: {
                wallet: true,
            },
        });
    }
}

