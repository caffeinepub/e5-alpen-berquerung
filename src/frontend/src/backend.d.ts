import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StagePhoto {
    id: string;
    stageId: bigint;
    description: string;
    blobHash: string;
    distanceKm?: number;
    timestamp: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStagePhoto(photoId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getCallerUserRole(): Promise<UserRole>;
    getStagePhotos(stageId: bigint): Promise<Array<StagePhoto>>;
    isCallerAdmin(): Promise<boolean>;
    uploadStagePhoto(stageId: bigint, description: string, blobHash: string, distanceKm: number | null): Promise<{
        __kind__: "ok";
        ok: StagePhoto;
    } | {
        __kind__: "err";
        err: string;
    }>;
    whoami(): Promise<Principal>;
}
