import time
import os
import readchar

CURSOR = '!'

WIDTH = 20
HEIGHT = 10

# make a list and fill with background
def create_canvas():
    canvas = []
    for i in range(HEIGHT):
        for j in range(0, WIDTH - 1):
            canvas.append(' ')
        canvas.append('\n')
    return canvas

CANVAS = create_canvas()

# display the canvas lol
def display_canvas():
    #top border
    for i in range(WIDTH):
        print('#', end='')
    print();

    for i in range(WIDTH * HEIGHT):
        print(CANVAS[i], end='')

    #bottom border
    for i in range(WIDTH):
        print('#', end='')
    print();

# put character on canvas
def plot(x, y, ch):
    if x >= 0 and x < WIDTH and y >= 0 and y < HEIGHT:
        CANVAS[y * WIDTH + x] = ch

def move_cursor(ch, cursor_x, cursor_y):
    if ch == 'd':
        cursor_x += 1
    elif ch == 'a':
        cursor_x -= 1
    elif ch == 's':
        cursor_y += 1
    elif ch == 'w':
        cursor_y -= 1
        
    if cursor_x > WIDTH - 2:
        cursor_x = 0

    if cursor_x < 0:
        cursor_x = WIDTH - 2

    if cursor_y > HEIGHT - 1:
        cursor_y = 0

    if cursor_y < 0:
        cursor_y = HEIGHT - 1

    return cursor_x, cursor_y

def main():
    # cursor pos
    cursor_x = 0
    cursor_y = 0

    last_cursor_x = 0
    last_cursor_y = 0

    temp = ' '
    BRUSH = u"\u2588"

    # woop
    while True:
        os.system('cls')

        temp = CANVAS[cursor_y * WIDTH + cursor_x]
        plot(cursor_x, cursor_y, CURSOR)

        display_canvas()

        ch = readchar.readkey()

        # exit :)
        if ch == 'c':
            exit(0)

        if ch == 'p':
            BRUSH = u"\u2591"
        if ch == 'l':
            BRUSH = u"\u2592"
        if ch == 'm':
            BRUSH = u"\u2588"

        last_cursor_x = cursor_x
        last_cursor_y = cursor_y
        
        cursor_x, cursor_y = move_cursor(ch, cursor_x, cursor_y)
        plot(last_cursor_x, last_cursor_y, temp)

        if ch == ' ':
            plot(cursor_x, cursor_y, BRUSH)

        
        




main()

#colors: 1234567890
#chars: qwertyuiop
#macros: asdfghjkl
#reserved: zxcvbnm

########################
#1:r #                 #
#2:g #                 #
#3:b #                 #
#4:y #                 #
#5:c #                 #
#6:m #                 #
#    #                 #
#    #                 #
#    #                 #
#    #                 #
#    #                 #
#    #                 #
#    #                 #
#    #                 #
#    #                 #
#    #                 #
########################