#contebajamos la imagen de node.js en la versión 10.21 que es en donde
#funciona nuestro proyecto
FROM node:10.21 

#Especificar en donde va ir el proyecto,es decir el container que va tener
#todo lo necesario para la app
WORKDIR /app

#Para pasar los archivos que necesitamos al directorio de trabajo
#es a través del comando COPY
COPY package*.json ./

#Para el funcionamiento de nuestra app es necesario correr el comando
#npm install ya que es el encargado de las depedencias para que funciones Node
RUN npm install

#Copiamos todos los archivos necesarios dentro del container
COPY . .

#Se utiliza el comando para ejecutar el proyecto
CMD ["npm","start"]