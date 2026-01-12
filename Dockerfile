# Stage-1 (DEPS) downloading everything in the project

FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Step-2 (Building) building using dependencies

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Public Variables (Safe to be in Dockerfile)
ENV NEXT_PUBLIC_DODO_PRODUCT_ID_WEEKLY="pdt_oSUd4xPamjIdbRaVYGTCz"
ENV NEXT_PUBLIC_DODO_PRODUCT_ID_MONTHLY="pdt_njUuqjuXNDA7LRaivug5W"
ENV NEXT_PUBLIC_DODO_PRODUCT_URL="https://checkout.dodopayments.com/buy/pdt_oSUd4xPamjIdbRaVYGTCz"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_dHJ1c3R5LWdyYWNrbGUtNTMuY2xlcmsuYWNjb3VudHMuZGV2JA"
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
ENV NEXT_PUBLIC_SUPABASE_URL="https://zdwhdzzqckfffvfmejdf.supabase.co"

# Secrets (MUST be passed as build args)
ARG DODO_WEBHOOK_KEY
ENV DODO_WEBHOOK_KEY=$DODO_WEBHOOK_KEY

ARG NEXT_PUBLIC_CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_SECRET_KEY=$NEXT_PUBLIC_CLERK_SECRET_KEY

ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build



# Stage - 3 (Runner) deployable image (ecr, eks)

# Stage - 3 (Runner) deployable image (ecr, eks)

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# creating a non root user

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# copy the files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000



CMD ["node","server.js"]