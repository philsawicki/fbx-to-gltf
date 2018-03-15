# Base image:
FROM node:9.8.0-alpine

# Set meta information about the container:
LABEL maintainer="Philippe Sawicki" \
      org.label-schema.name="fbx-to-gltf-webfrontend" \
      org.label-schema.description="Web Frontend for the FBX to glTF Converter" \
      org.label-schema.url="https://github.com/philsawicki/fbx-to-gltf" \
      org.label-schema.schema-version="1.0"

# Define environment variables:
ENV user node

# Change ownership of the application directory to the "node" User:
RUN mkdir -p /home/$user/app \
    && chown -R $user:$user /home/$user/app

# Run in the context of non-root user "node" inside the container for security:
USER $user

# Create application directory:
WORKDIR /home/$user/app

# Install application dependencies:
#
# A wildcard is used to ensure both "package.json" and "package-lock.json" are
# copied.
COPY package*.json ./
RUN npm install --only=production --loglevel warn --no-progress

# Bundle application sources:
COPY . .

# Launch the web server:
CMD ["npm", "run", "start:web"]

# Expose port 3000 to the Host:
EXPOSE 3000

# Register a script to assess the health of the service:
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node --experimental-modules /home/$user/app/healthcheck.mjs
