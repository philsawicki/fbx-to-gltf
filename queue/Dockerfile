# Base image must use "node", as "node:alpine" does not contain libraries or
# dependencies required by "FBX2glTF-linux-x64":
FROM node:9.8.0

# Set meta information about the container:
LABEL maintainer="Philippe Sawicki" \
      org.label-schema.name="fbx-to-gltf-converter" \
      org.label-schema.description="Converter process for the FBX to glTF webservice" \
      org.label-schema.url="https://github.com/philsawicki/fbx-to-gltf" \
      org.label-schema.schema-version="1.0"

# Define environment variables:
ENV user node

# Download the "FBX2glTF" binary from the GitHub repository and make it
# executable:
ADD https://github.com/facebookincubator/FBX2glTF/releases/download/v0.9.4/FBX2glTF-linux-x64 /usr/local/bin/
RUN chmod +x /usr/local/bin/FBX2glTF-linux-x64

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

# Launch the converter process:
CMD ["npm", "run", "start:converter"]
