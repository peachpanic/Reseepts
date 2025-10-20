FROM node:slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]