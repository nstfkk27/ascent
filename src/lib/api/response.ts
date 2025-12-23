import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: any;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

export function successResponse<T>(
  data: T,
  meta?: any,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  code?: string,
  status = 400,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status = 200
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createdResponse<T>(
  data: T,
  meta?: any
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, meta, 201);
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
