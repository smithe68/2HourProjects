#include <conio.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdlib.h>
#include <math.h>
#include <unistd.h>


#define WIDTH 30
#define HEIGHT 20
#define MAX_DIST 5
#define FOV 50

static char* canvas = NULL;

static char* world = 
    "          "
    "          " 
    "    #     " 
    "          " 
    "          ";


typedef struct Camera{
    double pos_x;
    double pos_y;
    double angle;
} Camera;

static Camera camera = (Camera)
{
    .pos_x = 1,
    .pos_y = 1,
    .angle = 45
};

void changeCamera(Camera *camera,char key)
{
    switch (key)
    {
        case 'w':
            camera->pos_y += .4;
        break;
        
        case 's' :
            camera->pos_y -= .4;
        break;
        
        case 'd':
            camera->pos_x += .4;
        break;

        case 'a':
            camera->pos_x -= .4;
        break;

        case 'q':
            camera->angle = fmod(camera->angle - 10, 360);
        break;
        
        case 'e':
            camera->angle = fmod(camera->angle + 10 , -360);
        break;
        
        default:
            break;
    }
}

void plot(int x, int y, char ch)
{
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT)
        canvas[y * WIDTH + x] = ch;
}

void displayCanvas()
{
    for (int i = 0; i < HEIGHT; i++)
    {
        for (int j = 0; j < WIDTH; j++)
        {
            putchar(canvas[i * HEIGHT + j]);
        }

        putchar('\n');
    }
}

/*
 * An ascii cube that can rotate within the terminal and be viewed from 
 * multiple different angles.
*/
int main(int argc, char* atgv) 
{
    // We create the canvas
    canvas = calloc(WIDTH * HEIGHT, sizeof(char));
    bool is_running = true;
    char brush = '#';

    double degToRad = (3.145 / 180.0);

    // Main loop
    while(is_running)
    {
        
        for (int x = 0; x < WIDTH; x++)
        {
            double perspective = ((x - WIDTH * 0.5) / (WIDTH * 0.5)) * FOV;

            
            double ang = (perspective + camera.angle) * degToRad;

            double dirX = cos(ang);
            double dirY = sin(ang);

            bool hit = false;
            double dist = 0;

            while (!hit && dist < MAX_DIST)
            {
                dist += 0.1;

                int hitX = (int)round(camera.pos_x + dirX * dist);
                if (hitX > WIDTH) break;

                int hitY = (int)round(camera.pos_y + dirY * dist);
                if (hitY > HEIGHT) break;

                if (world[hitY * WIDTH + hitX] == '#')
                    hit = true;
            }

            dist *= cos(ang - (camera.angle * degToRad));
            double d = (dist / (double)MAX_DIST) * (HEIGHT * 0.5);

            for (int y = 0; y < HEIGHT; y++)
            {
                if (dist >= 4) { brush = ' '; }
                else if (dist >= 3) { brush = '3'; }
                else if (dist >= 2) { brush = '2'; }
                else if (dist >= 1) { brush = '1'; }
                else brush = ' ';

                // char brush = ' ';
                // if (y >= d && y <= HEIGHT - d)
                //     brush = '#';

                plot(x, y, brush);    
            }
        }
        
        // Get User Input
        
        char ch = getch();
        changeCamera(&camera,ch);
        if (ch == 'c')
            is_running = false;
        system("cls");
        displayCanvas();
    }

    free(canvas);
    return 0; 
}